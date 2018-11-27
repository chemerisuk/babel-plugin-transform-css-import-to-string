const fs = require("fs");
const p = require("path");

const postcss = require("postcss");
const csswring = require("csswring");
const postcssPresetEnv = require("postcss-preset-env");
const postcssCalc = require("postcss-calc");
const deasyncPromise = require("deasync-promise");

module.exports = (b, options) => {
  const t = b.types;
  const prefixer = postcss([ postcssPresetEnv(options), postcssCalc(), csswring ]);

  return {
    visitor: {
      ImportDeclaration: {
        exit(path, state) {
          const node = path.node;

          if (node.source.value.slice(-4) === ".css") {
            const dir = p.dirname(p.resolve(state.file.opts.filename));
            const absolutePath = p.resolve(dir, node.source.value);
            const cssText = fs.readFileSync(absolutePath, "utf8");
            const result = deasyncPromise(prefixer.process(cssText, {from: absolutePath}));

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
