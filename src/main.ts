// Chalk Talk for Obsidian: a ```chalk-talk block (the text syntax or JSON) and a ```chalk-mermaid block (a Mermaid
// flowchart with `%% # chapter` and `%% > narration`) become a hand-drawn lesson inside the note. The lesson itself is
// chalk-talk/embed; this file only connects it to Obsidian: the blocks, «Expand» as a modal, the theme and language,
// the exported PDF (the drawing still) and one command. Nothing goes over the network.
import { type App, type Editor, getLanguage, MarkdownRenderChild, Modal, Plugin } from 'obsidian'
import { ChalkTextError, mountLesson, readRecipe, removeStyles, stillLesson, type Mounted, type Scene, type Theme } from 'chalk-talk/embed'

type Lang = 'en' | 'pt'
const lang = (): Lang => (getLanguage().toLowerCase().startsWith('pt') ? 'pt' : 'en')

const WORDS = {
  en: {
    insert: 'Insert a chalk-talk lesson',
    example: `title Saving coins
param n "coins a month" 1..8 = 3

# The hook
> Ana keeps some coins every month.
person ana at 150,330 "Ana" mood=idea
text "wants to save" right-of ana gap 16 align=start

# A year
> Each month, n coins go into the jar.
row at 470,150 gap 14
  repeat n: coin size 44
counter at 470,270 "12*n" "{v:0} coins in a year"`,
  },
  pt: {
    insert: 'Inserir aula do chalk-talk',
    example: `title Juntar moedas
param n "moedas por mês" 1..8 = 3

# O gancho
> A Ana guarda moedas todo mês.
person ana at 150,330 "Ana" mood=idea
text "quer poupar" right-of ana gap 16 align=start

# Um ano
> Cada mês, n moedas vão para o cofrinho.
row at 470,150 gap 14
  repeat n: coin size 44
counter at 470,270 "12*n" "{v:0} moedas num ano"`,
  },
}

// No theme in the recipe: the chalkboard on a dark Obsidian, the paper on a light one.
const theme = (): Theme => (document.body.classList.contains('theme-dark') ? 'chalkboard' : 'paper')

/** One block of a note: the lesson while the note is open, the drawing still in an exported PDF. */
class Lesson extends MarkdownRenderChild {
  private mounted?: Mounted

  constructor(el: HTMLElement, private source: string, private read: (source: string) => Promise<Scene>, private app: App) {
    super(el)
  }

  async onload() {
    let scene: Scene
    try {
      scene = await this.read(this.source)
    } catch (e) {
      return this.broken(e)
    }
    // Exporting to PDF renders the note inside .print: there the whole drawing, still.
    if (this.containerEl.closest('.print')) return stillLesson(this.containerEl, scene, theme())
    this.mounted = await mountLesson(this.containerEl, scene, {
      compact: true,
      lang: lang(),
      theme: theme(),
      onExpand: () => new LessonModal(this.app, scene).open(),
    })
  }

  onunload() {
    this.mounted?.destroy()
  }

  /** A mistake in the block, where the lesson would be: the line it is on, when the text syntax knows it. */
  private broken(e: unknown) {
    const box = this.containerEl.createDiv({ cls: 'chalk-talk-error' })
    box.createEl('b', { text: 'chalk-talk' })
    box.appendText(` · ${(e as Error).message}`)
    if (e instanceof ChalkTextError) {
      const line = this.source.split('\n')[e.line - 1]
      if (line?.trim()) box.createEl('code', { text: line })
    }
  }
}

/** «Expand»: the whole lesson — values, think about it, the quiz, the check, the downloads. */
class LessonModal extends Modal {
  private mounted?: Mounted

  constructor(app: App, private scene: Scene) {
    super(app)
  }

  async onOpen() {
    this.modalEl.addClass('chalk-talk-modal')
    this.mounted = await mountLesson(this.contentEl, this.scene, { lang: lang(), theme: theme() })
  }

  onClose() {
    this.mounted?.destroy()
    this.contentEl.empty()
  }
}

export default class ChalkTalkPlugin extends Plugin {
  async onload() {
    const block = (read: (source: string) => Promise<Scene>) => (source: string, el: HTMLElement, ctx: { addChild(c: MarkdownRenderChild): void }) =>
      ctx.addChild(new Lesson(el, source, read, this.app))
    this.registerMarkdownCodeBlockProcessor('chalk-talk', block(async (source) => readRecipe(source)))
    // Mermaid is large: loaded the first time a note has a ```chalk-mermaid block.
    this.registerMarkdownCodeBlockProcessor('chalk-mermaid', block(async (source) => {
      const { readMermaid } = await import('chalk-talk/embed-mermaid')
      return readMermaid(source, { locale: lang() === 'pt' ? 'pt-BR' : 'en-US' })
    }))
    this.addCommand({
      id: 'insert-lesson',
      name: WORDS[lang()].insert,
      editorCallback: (editor: Editor) => editor.replaceSelection('```chalk-talk\n' + WORDS[lang()].example + '\n```\n'),
    })
  }

  onunload() {
    removeStyles()
  }
}
