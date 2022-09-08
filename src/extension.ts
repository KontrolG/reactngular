// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

function getEditor() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  return editor;
}

interface ReplaceSelectedTextParams {
  replaceAll?: boolean;
  exampleInput: string;
  validInputChecker: (selectedText: string) => boolean;
  outputGenerator: (selectedText: string) => string;
}

function replaceText({
  replaceAll = false,
  exampleInput,
  validInputChecker,
  outputGenerator
}: ReplaceSelectedTextParams) {
  try {
    const editor = getEditor();

    if (!editor) {
      throw new Error("No tienes activa ninguna pestaña de edición");
    }

    const allDocument = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(editor.document.lineCount + 1, 0)
    );
    const selection = replaceAll ? allDocument : editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!validInputChecker(selectedText)) {
      throw new Error(
        `El texto seleccionado no concuerda con el tipo de cambio solicitado. Ejm: ${exampleInput}`
      );
    }

    editor.edit((edit) => {
      edit.replace(selection, outputGenerator(selectedText));
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `Ocurrió un error con la extensión: ${error}`
    );
  }
}

const conditionalClassRegExp = /\[class\.(.*?)\]="(.*?)"/gi;

const conditionalClassToClsxExpressionParams: ReplaceSelectedTextParams = {
  exampleInput: `[class.someClass]="someBoolean"`,
  validInputChecker: (selectedText: string) =>
    conditionalClassRegExp.test(selectedText),
  outputGenerator: (selectedText: string) =>
    selectedText.replace(conditionalClassRegExp, `$2 && "$1"`)
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "reactngular" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let selectionConditionalClassToClsxExpression =
    vscode.commands.registerCommand(
      "reactngular.selectionConditionalClassToClsxExpression",
      () => {
        replaceText(conditionalClassToClsxExpressionParams);
      }
    );

  context.subscriptions.push(selectionConditionalClassToClsxExpression);
}

// this method is called when your extension is deactivated
export function deactivate() {}
