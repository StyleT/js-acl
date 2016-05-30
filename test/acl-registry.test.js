'use strict';

var expect  = require('chai').expect;
var aclRegistryService = require('../src/acl-registry');

describe('AclRegistryService', function () {
    /** @type {AclRegistryService} */
    var AclRegistryService;

    beforeEach(function () {
        AclRegistryService = new aclRegistryService();
    });

    it('tests basic Role inheritance', function () {
        AclRegistryService
            .add('guest')
            .add('member', 'guest')
            .add('editor', 'member');

        expect(AclRegistryService.getParents('guest')).to.deep.equal([]);

        var roleMemberParents = AclRegistryService.getParents('member');
        expect(roleMemberParents.length).to.equal(1);
        expect(roleMemberParents).to.include('guest');

        var roleEditorParents = AclRegistryService.getParents('editor');
        expect(roleEditorParents.length).to.equal(1);
        expect(roleEditorParents).to.include('member');

        expect(AclRegistryService.inherits('member', 'guest', true)).to.be.true;
        expect(AclRegistryService.inherits('editor', 'member', true)).to.be.true;
        expect(AclRegistryService.inherits('editor', 'guest')).to.be.true;

        expect(AclRegistryService.inherits('guest', 'member')).to.be.false;
        expect(AclRegistryService.inherits('member', 'editor')).to.be.false;
        expect(AclRegistryService.inherits('guest', 'editor')).to.be.false;
    });

    it('tests basic Role multiple inheritance with array', function () {
        AclRegistryService
            .add('parent1')
            .add('parent2')
            .add('child', ['parent1', 'parent2']);

        var roleChildParents = AclRegistryService.getParents('child');
        expect(roleChildParents.length).to.equal(2);
        expect(roleChildParents).to.include.members(['parent1', 'parent2']);

        expect(AclRegistryService.inherits('child', 'parent1')).to.be.true;
        expect(AclRegistryService.inherits('child', 'parent2')).to.be.true;

        AclRegistryService.remove('parent2');

        roleChildParents = AclRegistryService.getParents('child');
        expect(roleChildParents.length).to.equal(1);
        expect(roleChildParents).to.include('parent1');
        expect(AclRegistryService.inherits('child', 'parent1')).to.be.true;
    });

    it('ensures that the same Role cannot be registered more than once to the registry', function () {
        AclRegistryService.add('tst');

        expect(function() {
            AclRegistryService.add('tst');
        }).to.throw();
    });

});
