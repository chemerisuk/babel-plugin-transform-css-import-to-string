const fs = require("fs");
const p = require("path");

const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const csswring = require("csswring");
const cssvariables = require("postcss-css-variables");

module.exports = (b, options) => {
  const t = b.types;
  const prefixer = postcss([ cssvariables(), autoprefixer(options), csswring ]);

  return {
    visitor: {
      ImportDeclaration: {
        exit(path, state) {
          const node = path.node;

          if (node.source.value.slice(-4) === ".css") {
            const dir = p.dirname(p.resolve(state.file.opts.filename));
            const absolutePath = p.resolve(dir, node.source.value);
            const cssText = fs.readFileSync(absolutePath, "utf8");
            const result = prefixer.process(cssText);

            path.replaceWith(t.variableDeclaration("var", [
              t.variableDeclarator(
                t.identifier(node.specifiers[0].local.name),
                t.stringLiteral(result.css))]));
          }
        }
      }
    }
  };
};
