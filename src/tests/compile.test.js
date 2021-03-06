import assert from 'assert'
import "regenerator-runtime/runtime.js";

import CompileCommand from '../commands/compile'
import CompilerCommandMessage from '../commands/utils/CompilerCommandMessage';
import CompilationParser from '../commands/utils/CompilationParser';

let fakeMessage = {
    content: ''
};

const msg = new CompilerCommandMessage(fakeMessage);
const parser = new CompilationParser(msg);
describe('Compile Command', function() {
    this.timeout(5000);
    it('Parse url', () => {
        let url = 'http://michaelwflaherty.com/files/conversation.txt';
        fakeMessage.content = ';compile c++ < ' + url;
        let argsData = parser.parseArguments();
        assert.strictEqual(argsData.fileInput, url);
    });
    it('Parse options', () => {
        let args = ['-O3', '-std=c++11', '-fake-flag1', '-fake-flag2'];
        let expected = args.join(' ');

        fakeMessage.content = ';compile c++ ' + expected;
        let argsData = parser.parseArguments();

        assert.strictEqual(argsData.options, expected.trim());
    });
    it('Parse all url', () => {
        let url = 'http://michaelwflaherty.com/files/conversation.txt';
        let stdin = 'testing 1 2 3';
        let options = '-O3 -std=c++11 -fake-flag1 -fake-flag2';
        fakeMessage.content = `;compile c++ ${options} < ${url} | ${stdin}`
        let argsData = parser.parseArguments();

        assert.strictEqual(argsData.options, options);
        assert.strictEqual(argsData.fileInput, url);
        assert.strictEqual(argsData.stdin, 'testing 1 2 3');
    });
    it('Parse all url - code block stdin', () => {
        let url = 'http://michaelwflaherty.com/files/conversation.txt';
        let stdin = 'testing 1 2 3';
        let options = '-O3 -std=c++11 -fake-flag1 -fake-flag2';
        fakeMessage.content = `;compile c++ ${options} < ${url} | \`\`\`\n${stdin}\`\`\``
        let argsData = parser.parseArguments();

        assert.strictEqual(argsData.options, options);
        assert.strictEqual(argsData.fileInput, url);
        assert.strictEqual(argsData.stdin, 'testing 1 2 3');
    });
    it('Parse all standard', () => {
        let stdin = 'testing 1 2 3';
        let options = '-O3 -std=c++11 -fake-flag1 -fake-flag2';
        fakeMessage.content = `;compile c++ ${options} | ${stdin}\n\`\`\`cpp\nint main() {}\n\`\`\``
        let argsData = parser.parseArguments();

        assert.strictEqual(argsData.options, options);
        assert.strictEqual(argsData.stdin, 'testing 1 2 3');
    });
    it('Parse all standard - code block stdin', () => {
        let stdin = 'testing 1 2 3';
        let options = '-O3 -std=c++11 -fake-flag1 -fake-flag2';
        fakeMessage.content = `;compile c++ ${options} | \`\`\`\n${stdin}\`\`\`\n\`\`\`cpp\nint main() {}\n\`\`\``
        let argsData = parser.parseArguments();

        assert.strictEqual(argsData.options, options);
        assert.strictEqual(argsData.stdin, 'testing 1 2 3');
    });
    it('Parse stdin block from text', () => {
        fakeMessage.content = '```\ntesting 1 2 3\n```\n```cpp\nint main() {}\n```'
        const stdin = parser.getStdinBlockFromText();
        assert.strictEqual(stdin, 'testing 1 2 3');
    });
    it('Parser stop on newln', () => {
        fakeMessage.content = ';compile c++\n int main() {}'

        try {
            //parseArguments() should throw with the given input
            const out = parser.parseArguments();
            assert(false);
        }
        catch (e) {
            assert(true);
        }
    });
    it('Parse code from text', () => {
        fakeMessage.content = '```\ntesting 1 2 3\n```\n```cpp\nint main() {}\n```'
        const code = parser.getCodeBlockFromText();
        assert.strictEqual(code, 'cpp\nint main() {}');
    });
    it('Parse no trailing space', () => {
        let options = '-O3 -std=c++11 -fake-flag1 -fake-flag2';
        fakeMessage.content = `;compile c++ ${options}\`\`\`cpp int main() {} \`\`\``
        let argsData = parser.parseArguments();

        assert.strictEqual(argsData.options, options)
        assert.strictEqual(argsData.lang, 'c++');
    });
    it('Parse no trailing space (no options)', () => {
        fakeMessage.content = `;compile c++\`\`\`cpp int main() {} \`\`\``
        let argsData = parser.parseArguments();

        assert.strictEqual(argsData.lang, 'c++');
    });
    it('Ignore language casing', () => {
        fakeMessage.content = `;compile C++\n\`\`\`cpp int main() {} \`\`\``
        let argsData = parser.parseArguments();

        assert.strictEqual(argsData.lang, 'c++');
    });
    it('Clean language specifier', () => {
        fakeMessage.content = '```cpp\nint main() {}\n```';
        let code = parser.getCodeBlockFromText();
        code = CompilationParser.cleanLanguageSpecifier(code);
        assert.strictEqual(code, '\nint main() {}');
    });
    it('Compilation Embed', async () => {
        let json = JSON.parse('{ "permlink": "98AbZMTsa5f9MwDd", "status": "0", "url": "https://someurl.com"}')
        
        let msg = {
            message : {
                author: {
                    tag: 'awd'
                }
            }
        }

        let embed = CompileCommand.buildResponseEmbed(msg, json);

        assert.strictEqual(embed.color, 0x046604);
        assert.strictEqual(embed.fields.length, 2);
    });
});
