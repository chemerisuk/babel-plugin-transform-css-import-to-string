import fs from 'fs';
import p from 'path';
import postcssJs from 'postcss-js';
import autoprefixer from 'autoprefixer';
import csswring from 'csswring';
import customProperties from 'postcss-custom-properties';

const browsers = ["ChromeAndroid 30", "iOS 7", "IE 10"];
const prefixer = postcssJs.sync([ customProperties(), autoprefixer({browsers}), csswring ]);

function endsWith(str, search) {
  return str.indexOf(search, str.length - search.length) !== -1;
}

export default function ({ types: t }) {
  return {
    visitor: {
      ImportDeclaration: {
        exit: function(path, state) {
          const node = path.node;

          if (endsWith(node.source.value, '.css')) {
            const dir = p.dirname(p.resolve(state.file.opts.filename));
            const absolutePath = p.resolve(dir, node.source.value);
            const css = prefixer(fs.readFileSync(absolutePath, "utf8"));

            path.replaceWith(t.variableDeclaration("var", [
              t.variableDeclarator(
                t.identifier(node.specifiers[0].local.name),
                t.stringLiteral(css))]));
          }
        }
      }
    }
  };
}
