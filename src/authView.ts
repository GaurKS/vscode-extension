import * as vscode from 'vscode';
import login from '@metacall/protocol/login';
import API, { ProtocolError } from '@metacall/protocol/protocol';
// import { config } from 'process';

// Define your authentication view
export class AuthView {
  private _panel: vscode.WebviewPanel;
  private _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Initialize the view
    this._panel.webview.html = this._getHtmlContent();

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'authenticate':
            console.log('Authenticating...');
            console.log(message.email);
            console.log(message.password);

            // Authentication logic here
            let token:any = '';
            try {
              // Authenticate the user
              token = authLogin(message.email, message.password);
              console.log("Auth done, token: ", token);
              // Save the token in the extension's global state
              vscode.commands.executeCommand('setContext', 'metacall:token', token);
              // Save the token in the extension's global state
              vscode.commands.executeCommand('setContext', 'metacall:isAuthenticated', true);
              // Save the token in the extension's global state
              vscode.commands.executeCommand('setContext', 'metacall:email', message.email);

              // Close the view
              this.dispose();

            } catch (err) {
              console.error(err);
            }
            // Save user credentials securely using vscode.secrets
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

  // Get the HTML content for the view
  private _getHtmlContent(): string {
    return `
      <html>
        <body>
          <h1>Login to your Metacall Account</h1>
          <form>
            <label for="email">Email:</label>
            <input type="text" id="email" name="email" required>
            <br>
            <br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <br>
            <br>
            <button id="authenticate">Authenticate</button>
          </form>

          <script>
            const vscode = acquireVsCodeApi();
            const form = document.querySelector('form');
            const authenticateButton = document.querySelector('#authenticate');

            form.addEventListener('submit', event => {
              event.preventDefault();
              const email = document.querySelector('#email').value;
              const password = document.querySelector('#password').value;

              // Send a message to the extension with the user's credentials
              vscode.postMessage({
                command: 'authenticate',
                email: email,
                password: password
              });
            });

            authenticateButton.disabled = false;
          </script>
        </body>
      </html>
    `;
  }

  // Clean up resources
  public dispose(): void {
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}

const authLogin = async (email: string, password: string): Promise<string> => {
  try {
    const token = await login(email, password, 'https://dashboard.metacall.io');
    return token;
  } catch (err: any) {
    vscode.window.showErrorMessage('Error authenticating user');
    vscode.window.showErrorMessage(err.message);
    console.error(err);
    return '';
  }
};


// export class AuthView {
//     private _panel: vscode.WebviewPanel | undefined;
//     private _disposables: vscode.Disposable[] = [];

//     public static currentPanel: AuthView | undefined;

//     public static createOrShow(extensionUri: vscode.Uri) {
//         const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

//         // If we already have a panel, show it.
//         if (AuthView.currentPanel) {
//             AuthView.currentPanel._panel.reveal(column);
//             return;
//         }

//         // Otherwise, create a new panel.
//         const panel = vscode.window.createWebviewPanel(
//             'authView',
//             'Auth View',
//             column || vscode.ViewColumn.One,
//             { enableScripts: true },    
//         );

//         AuthView.currentPanel = new AuthView(panel, extensionUri);
//     } 

//     public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
//         AuthView.currentPanel = new AuthView(panel, extensionUri);
//     }

//     private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) { 
