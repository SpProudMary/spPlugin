import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

export default class SPPMPlugin extends Plugin {
	async onload() {
		this.addRibbonIcon('dice', 'Suggest random TODO', (evt) => {
			this.suggestTodo()
		})
	}

	async suggestTodo() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
		if (!activeView) {
			new Notice("No active note found!")
			return
		}

		let content: string | null = null;
		if (activeView.getMode() === "source") {
			const editor = activeView.editor
			content = editor.getValue()
		} else if (activeView.getMode() === "preview") {
			const file = activeView.file
			if (file != null)
				content = await this.app.vault.read(file)
		}

		if (content == null) {
			new Notice("Could not read content!")
			return
		}

		const todo = this.suggestTodoImpl(content);

		if (todo == null) {
			new Notice("No TODOs available!")
			return
		}

		new ResultModal(this.app, todo).open()
	}

	suggestTodoImpl(content: string): string | null {
		const todos = content.split("\n")
			// find TODOs
			.filter(line => {
				if (line.startsWith('- [x]')) return false
				return line.startsWith('- ') || line.startsWith('- [ ]')
			})
			// prettify TODOs
			.map(line => line.replace('- [ ]', '- ').trim())

		if (todos.length === 0) {
			return null
		}

		const randomLine = todos[Math.floor(Math.random() * todos.length)]
		return randomLine
	}
}

class ResultModal extends Modal {
	constructor(app: App, todo: string) {
		super(app)

		this.setTitle('Your TODO')
		this.setContent(todo)

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('OK')
					.setCta()
					.onClick(() => {
						this.close()
					})
			)
	}
}