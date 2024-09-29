import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';
import { config as testing_config } from '../../../test/testing-config';
import { config } from '../../config/config';
import { FolderItemPM, ItemPM, ObjectPostMan } from '../models/postman.model';

@Injectable()
export class GeneratePostManCollectionService implements OnApplicationBootstrap {
  private arrayOfDto: any[] = [];
  private arrayOfSpec: any[] = [];
  private collectionJson: ObjectPostMan = {
    info: {
      name: 'P1',
      description: 'La collection de Paddock One.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
    variable: [
      {
        key: 'link',
        value: `http://localhost:${config().port}`,
        type: 'string',
      },
      {
        key: 'authorization',
        value:
          'Authorization=Bearer%20eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcxLCJmaXJzdG5hbWUiOiJzYWNoYSIsImxhc3RuYW1lIjoicGFzdG9yZSBkZSB2YXJkbyIsIm1haWwiOiJzYWNoYS5wYXN0b3JlZGV2YXJkb0BzeW5ldGhpcy5jb20iLCJpYXQiOjE3MjQyNDE4ODAsImV4cCI6MTcyNTQ0MTg4MH0.l-LWrCAilPYpKYQ_4prNbXKtFX4Tu47ub1PnV5nwTNvQmR3yB4X2wY9KpHzvJScz82rX2v8aD1pX3-Z6RsKXY5WMF3PKfimbLosyJ0xWAk5xedF_F58_yvB01sLm_M7svfX3JQbAL6WGqM75Z4ICBNLSVzt_53p7db115vy3axlTYXuFzXRz-LsXU-UrdGSDPJv_xoYY6IFVpu1502hNkXvHs_8Ron1M9mqi9sshGfJFEDYGZ988Oga-VfOZbjHv0OTXvR4uPQ9O-RGa0cCFa3ihK-mknLGNt4VJ8udxqtgU5HGzmSc8cvja7hfXuzyjqK8woe0atPoOcXLPrW1sDQ; Domain=localhost; Path=/',
        type: 'string',
      },
    ],
  };

  async onApplicationBootstrap() {
    this.generatePostManJsonCollectionFile(config().api.generatePostmanCollection || testing_config().api.generatePostmanCollection);
  }

  /**
   * @description Analyse les fichiers .ts et récupère les informations nécessaires pour générer le fichier de collection Postman
   * @param filePaths Chemins des fichiers .ts à analyser
   * @returns Objet de la structure de Postman
   */
  private generatePostManObject(filePaths: string[]): ObjectPostMan {
    this.getAllDto();
    this.getDescribeSpec();
    filePaths.forEach((filePath) => {
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
      let obj: FolderItemPM = { name: '', item: [], description: undefined };

      const extractInfosTSFile = (node: ts.Node): void => {
        if (ts.isClassDeclaration(node) && node.name) {
          const className = node.name.text;
          let classDecoratorPath = '';

          const classDecorators = ts.getDecorators(node);
          if (classDecorators) {
            classDecorators.forEach((decorator) => {
              if (ts.isCallExpression(decorator.expression)) {
                const decoratorName = (decorator.expression.expression as ts.Identifier).text;
                if (decoratorName === 'Controller') {
                  classDecoratorPath = decorator.expression.arguments[0] ? (decorator.expression.arguments[0] as ts.StringLiteral).text : '';
                }
              }
            });
          }
          ts.forEachChild(node, (child) => {
            if (ts.isMethodDeclaration(child) && child.name) {
              const methodName = (child.name as ts.Identifier).text;
              let httpMethod = '';
              let path = '';
              let bodyContent: any | undefined = undefined;

              const decorators = ts.getDecorators(child);
              if (decorators) {
                decorators.forEach((decorator) => {
                  if (ts.isCallExpression(decorator.expression)) {
                    const decoratorName = (decorator.expression.expression as ts.Identifier).text;
                    if (['Get', 'Post', 'Put', 'Patch', 'Delete'].includes(decoratorName)) {
                      httpMethod = decoratorName.toUpperCase();
                      path = decorator.expression.arguments[0] ? (decorator.expression.arguments[0] as ts.StringLiteral).text : '';
                    }
                  }
                });
              }

              if (child.parameters) {
                child.parameters.forEach((param) => {
                  const paramDecorators = ts.getDecorators(param);
                  if (paramDecorators) {
                    paramDecorators.forEach((paramDecorator) => {
                      if (ts.isCallExpression(paramDecorator.expression)) {
                        const paramDecoratorName = (paramDecorator.expression.expression as ts.Identifier).text;
                        if (paramDecoratorName === 'Body') {
                          bodyContent = this.getTypesBodies(this.arrayOfDto, param.type.getText());
                        }
                      }
                    });
                  }
                });
              }

              if (httpMethod) {
                obj.name = className.replace('Controller', '');
                let descriptonObject = this.getTypesBodies(this.arrayOfSpec, obj.name);
                if (descriptonObject) {
                  obj.description = 'Description des routes : \n' + descriptonObject;
                }
                if (obj.name !== '') {
                  const pathAfterSplit: string[] | undefined = path.split('/')[0] != '' ? path.split('/') : undefined;
                  const item: ItemPM = {
                    name: methodName,
                    request: {
                      method: httpMethod,
                      header: [
                        {
                          key: 'Cookie',
                          value: '{{authorization}}',
                          type: 'text',
                        },
                      ],
                      body: bodyContent
                        ? {
                            mode: 'raw',
                            raw: JSON.stringify(bodyContent, null, 2),
                            options: {
                              raw: {
                                language: 'json',
                              },
                            },
                          }
                        : undefined,
                      url: {
                        raw: `{{link}}${classDecoratorPath}${path ? '/' + path : ''}`,
                        host: ['{{link}}'],
                        path: pathAfterSplit ? [classDecoratorPath, ...pathAfterSplit] : [classDecoratorPath],
                      },
                    },
                  };
                  obj.item.push(item);
                }
              }
            }
          });
        }
        ts.forEachChild(node, extractInfosTSFile);
      };

      extractInfosTSFile(sourceFile);
      this.collectionJson.item.push(obj);
    });
    return this.collectionJson;
  }
  /**
   * @description Récupère tous les chemins des fichiers d'un répertoire avec une extension donnée
   * @param extension Extension des fichiers à rechercher
   * @param dirName Chemin du répertoire à scanner (par défaut, le répertoire src)
   * @returns Tableau contenant les chemins des fichiers trouvés
   */
  private getAllFilesPathsWithExtension(extension: string, dir: string = path.join(__dirname, '..', '..', '..', '..', 'src')): string[] {
    let results: string[] = [];
    const contentDirectory = fs.readdirSync(dir);

    contentDirectory.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {
        results = results.concat(this.getAllFilesPathsWithExtension(extension, filePath));
      } else if (file.endsWith(extension)) {
        results.push(filePath);
      }
    });

    return results;
  }
  /**
   * @description Organise les items de l'objet de la structure de Postman
   * @param object Objet de la structure de Postman à organiser
   * @returns Objet de la structure de Postman organisé
   */
  private organizationOfItems(object: ObjectPostMan): ObjectPostMan {
    object.item = object.item.filter((elem) => elem.name !== '' || elem.item.length > 0);
    object.item.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    return object;
  }

  /**
   * @description Génère le fichier de collection Postman
   */
  public generatePostManJsonCollectionFile(activate: boolean = false): void {
    if (activate) {
      const filePaths: string[] = this.getAllFilesPathsWithExtension('.controller.ts');
      const ObjectPostMan: ObjectPostMan = this.generatePostManObject(filePaths);
      const object = this.organizationOfItems(ObjectPostMan);
      const objectJson = JSON.stringify(object, null, 2);
      const savePath = path.join(__dirname, '..', '..', '..', '..', 'src', 'assets', 'postman', 'P1.postman_collection.json');
      fs.writeFile(savePath, objectJson, 'utf-8', (err) => {
        if (err) {
          Logger.error(err);
        }
        Logger.log('Postman collection file generated !');
        this.collectionJson = {
          info: {
            name: 'P1',
            description: 'La collection de Paddock One.',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
          },
          item: [],
          variable: [
            {
              key: 'link',
              value: 'http://localhost:3500',
              type: 'string',
            },
            {
              key: 'authorization',
              value:
                'Authorization=Bearer%20eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcxLCJmaXJzdG5hbWUiOiJzYWNoYSIsImxhc3RuYW1lIjoicGFzdG9yZSBkZSB2YXJkbyIsIm1haWwiOiJzYWNoYS5wYXN0b3JlZGV2YXJkb0BzeW5ldGhpcy5jb20iLCJpYXQiOjE3MjMwMzU1NTEsImV4cCI6MTcyNDIzNTU1MX0.jlpRjAtYC__6af_0m4Hhy_d45x25GLJMpS-l5-TuvLVX9IAlWSGc6RSAIuPfg6Z4HYkCnAUAhXdser5Xo-t-ICYLwNINp4UQfscHipmZiAVlTnILw-2QQ6rhsdjzdoQGbmG38VlpsqU0hMprL0NfxT6YgACjJ2VtzvGRpfwTAX_c1j4N0Zk2L3a18Jl9Xw90nmhdw8RPbBy1FpqCpgSF0ycvZkbE_vrNZwJfjbGHsTIWg2uBQt6bkutsYaHiijQZ0veqY66QAQ-ldM3GiZPz1A7LR73eJzloDDKJMQfWntmuMRpj5U0K4T3BeaTVJKciY7dxxEgoOBGo57jOBAMmmA; Domain=localhost; Path=/; HttpOnly',
              type: 'string',
            },
          ],
        };
      });
    }
  }

  /**
   * @description Récupère les informations des fichiers .dto.ts
   */
  private getAllDto(): void {
    this.arrayOfDto = [];
    this.getAllFilesPathsWithExtension('.dto.ts').forEach((filePath) => {
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
      let interfaceDto: any = {};
      const extractInfosTSFile = (node: ts.Node): void => {
        if (ts.isClassDeclaration(node) && node.name) {
          const className = node.name.text;
          node.members.forEach((member) => {
            if (ts.isPropertyDeclaration(member) && member.name) {
              const name = member.name.getText();
              let type: string | null = null;
              let isOptional = false;

              if (member.type) {
                type = member.type.getText();
              }

              if (member.questionToken) {
                isOptional = true;
              }
              interfaceDto[name] = isOptional ? `${type} | undefined` : type;
            }
          });
          this.arrayOfDto.push({ [className]: interfaceDto });
        }

        ts.forEachChild(node, extractInfosTSFile);
      };

      extractInfosTSFile(sourceFile);
    });
  }

  /**
   * @description Récupère le contenu d'un type donné [ { type: value } ]
   */
  private getTypesBodies(array: any[], typeName: string): any | undefined {
    const foundObject = array.find((item) => item[typeName] !== undefined);
    return foundObject ? foundObject[typeName] : undefined;
  }

  /**
   * @description Récupère les informations des fichiers .controller.spec.ts
   */
  private getDescribeSpec(): void {
    this.getAllFilesPathsWithExtension('.controller.spec.ts').forEach((filePath) => {
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
      let obj = { describe: '', it: '' };
      let result: string = '';
      const findTestBlocks = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const expression = node.expression;
          if (ts.isIdentifier(expression)) {
            const functionName = expression.text;
            if (functionName === 'describe' || functionName === 'it') {
              const firstArgument = node.arguments[0];
              if (ts.isStringLiteral(firstArgument)) {
                obj[functionName] = firstArgument.text;
                if (functionName === 'it') {
                  result += `La route ${obj.describe} ${obj.it}. `;
                  result += '\n';
                  obj = { describe: '', it: '' };
                }
              }
            }
          }
        }
        ts.forEachChild(node, (childNode) => findTestBlocks(childNode));
      };
      findTestBlocks(sourceFile);
      let resultObject = {};
      const nameResultObject = result.split(' ')[2].replace('Controller', '');
      resultObject[nameResultObject] = result.replace(`La route ${nameResultObject}Controller should be defined. \n`, '');
      this.arrayOfSpec.push(resultObject);
    });
  }
}
