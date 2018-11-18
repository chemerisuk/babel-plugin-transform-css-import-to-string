const fs = require("fs");
const p = require("p");

const postcssJs = require("postcss-js");
const autoprefixer = require("autoprefixer");
const csswring = require("csswring");
const customProperties = require("postcss-custom-properties");

const browsers = ["ChromeAndroid 30", "iOS 7", "IE 10"];
const prefixer = postcssJs.sync([ customProperties(), autoprefixer({browsers}), csswring ]);

function endsWith(str, search) {
  return str.indexOf(search, str.length - search.length) !== -1;
}

module.exports = babel => {
  const t = babel.types;

  return {
    visitor: {
      ImportDeclaration: {
        exit(path, state) {
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
};

