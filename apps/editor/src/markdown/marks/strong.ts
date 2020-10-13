import { DOMOutputSpecArray } from 'prosemirror-model';
import { EditorCommand } from '@t/spec';
import { cls } from '@/utils/dom';
import Mark from '@/spec/mark';
import { resolveSelectionPos } from '../helper/pos';
import { createTextSelection } from '../helper/manipulation';

const reStrong = /^(\*{2}|_{2}).*([\s\S]*)\1$/m;
const strongSyntax = '**';

export class Strong extends Mark {
  get name() {
    return 'strong';
  }

  get schema() {
    return {
      toDOM(): DOMOutputSpecArray {
        return ['span', { class: cls('strong') }, 0];
      }
    };
  }

  private bold(): EditorCommand {
    return () => (state, dispatch) => {
      const [from, to] = resolveSelectionPos(state.selection);
      const { empty } = state.selection;
      const slice = state.selection.content();
      const textContent = slice.content.textBetween(0, slice.content.size, '\n');
      let { tr } = state;

      if (reStrong.test(textContent)) {
        tr = tr.delete(to - 2, to).delete(from, from + 2);
      } else {
        tr = tr.insertText(strongSyntax, to).insertText(strongSyntax, from);
        const selection = empty
          ? createTextSelection(tr, from + 2)
          : createTextSelection(tr, from, to + 4);

        tr = tr.setSelection(selection);
      }
      dispatch!(tr);

      return true;
    };
  }

  commands() {
    return { bold: this.bold() };
  }

  keymaps() {
    const boldCommand = this.bold()();

    return { 'Mod-b': boldCommand, 'Mod-B': boldCommand };
  }
}
