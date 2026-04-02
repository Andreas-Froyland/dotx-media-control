import Plugin, { runPlugin } from "npm:@dotmatrixlabs/dotx-plugin-sdk";

class HelloWorld extends Plugin {
  async onLoad() {
    await this.ui.showToast({ message: "Hello from plugin!", type: "success" });
  }
}

runPlugin(HelloWorld);
