import assert from 'assert'
import "regenerator-runtime/runtime.js";

import {Wandbox, WandboxSetup} from '../utils/apis/Wandbox'

const compilers = new Wandbox(null);

describe('Wandbox', function () {
    this.timeout(10000);
    it('Initialize compilers', () => {
        return compilers.initialize();
    });
    it('Check invalid compiler', () => {
        assert.ok(!compilers.isValidCompiler('c++'));
    });
    it('Check valid compiler', () => {
        assert.ok(compilers.isValidCompiler('clang-3.9.1'));
    });
    it('Check valid language', () => {
        assert.ok(compilers.has('c++'));
    });
    it('Check invalid language', () => {
        assert.ok(!compilers.has('c--'));
    });
    it('Compiler blacklist', () => {
        let blacklist = compilers.brokencompilers;
        blacklist.forEach(compiler => {
            assert.ok(!compilers.isValidCompiler(compiler));
        });
    });
    it('Compiler deduction', () => {
        let setup = new WandboxSetup('', 'c++', '', false, '', compilers);
        assert.notEqual(setup.compiler, 'c++');
    });
    it('Compilation dispatch', async () => {
        let setup = new WandboxSetup('int main() {}', 'c++', '', true, '', compilers);
        return await setup.compile();
    });
});