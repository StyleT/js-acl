'use strict';

var Acl     = require(__dirname + '/../dist/acl');
var expect  = require('chai').expect;

describe('Acl', function () {
    /** @type {Acl} */
    var AclService,
        userIdentityStub = {
            roles: null,
            getRoles: function () {
                return this.roles;
            }
        },
        resourceStub = {
            name: 'Dezmond',
            resourceId: 'test',
            getResourceId: function () {
                return this.resourceId;
            }
        };

    beforeEach(function () {
        AclService = new Acl();

        userIdentityStub.roles = ['user', 'test'];
        resourceStub.resourceId = 'test';
    });

    describe('UserIdentity management', function () {
        it('should return null by default', function () {
            expect(AclService.getUserIdentity()).to.deep.equal(null);
        });

        it('should set valid user identity', function () {
            userIdentityStub.roles = [];
            AclService.setUserIdentity(userIdentityStub);
            expect(AclService.getUserIdentity()).to.deep.equal(userIdentityStub);
        });

        it('should create inherited role for user identity or replace old one if it exists', function () {
            AclService.addRole('Guest');
            AclService.addRole('User');
            AclService.addRole('Admin');

            userIdentityStub.roles = ['User', 'Guest'];
            AclService.setUserIdentity(userIdentityStub);

            expect(AclService.hasRole(AclService.USER_IDENTITY_ROLE)).to.be.true;
            expect(AclService.inheritsRole(AclService.USER_IDENTITY_ROLE, 'Guest')).to.be.true;
            expect(AclService.inheritsRole(AclService.USER_IDENTITY_ROLE, 'User')).to.be.true;
            expect(AclService.inheritsRole(AclService.USER_IDENTITY_ROLE, 'Admin')).to.be.false;

            userIdentityStub.roles = ['Admin'];
            AclService.setUserIdentity(userIdentityStub);
            expect(AclService.inheritsRole(AclService.USER_IDENTITY_ROLE, 'Admin')).to.be.true;
            expect(AclService.inheritsRole(AclService.USER_IDENTITY_ROLE, 'Guest')).to.be.false;
            expect(AclService.inheritsRole(AclService.USER_IDENTITY_ROLE, 'User')).to.be.false;
        });

        it('should throw error with invalid user identity', function () {
            expect(function() {
                AclService.setUserIdentity({});
            }).to.throw(Error);
        });

        it('should return AclService object', function () {
            userIdentityStub.roles = [];
            expect(AclService.setUserIdentity(userIdentityStub)).to.deep.equal(AclService);
        });

        it('should clean previously specified entity', function () {
            userIdentityStub.roles = [];
            AclService.setUserIdentity(userIdentityStub);
            expect(AclService.getUserIdentity()).to.deep.equal(userIdentityStub);

            AclService.clearUserIdentity();
            expect(AclService.getUserIdentity()).to.deep.equal(null);
        });
    });

    describe('Role management', function () {
        it('ensures that basic addition and retrieval of a single Role works', function () {
            expect(AclService.getRoles()).to.deep.equal([]);

            var role = AclService.addRole('guest').getRole('guest');

            expect(role).to.deep.equal('guest');
            expect(AclService.getRole('guest')).to.deep.equal('guest');
        });

        it('ensures that getRoles() method works as expected', function () {
            expect(AclService.getRoles()).to.deep.equal([]);

            AclService
                .addRole('guest')
                .addRole('staff', 'guest')
                .addRole('editor', 'staff')
                .addRole('administrator');

            expect(AclService.getRoles()).to.deep.equal(['guest', 'staff', 'editor', 'administrator']);
        });

        it('basic role adding/removal', function () {
            AclService.addRole('User');
            AclService.addRole('Manager', 'User');
            AclService.addRole('God', 'Manager');

            expect(AclService.hasRole('Manager')).to.be.true;

            AclService.removeRole('Manager');

            expect(AclService.hasRole('Manager')).to.be.false;
            expect(AclService.hasRole('God')).to.be.true;
        });

        it('should throw Exception during removal of unexisted role', function () {
            expect(function() {
                AclService.removeRole('unexisted');
            }).to.throw(Error);
        });

        it('ensures that removal of all Roles works', function () {
            AclService.addRole('Guest');
            expect(AclService.hasRole('Guest')).to.be.true;

            AclService.removeRoleAll();
            expect(AclService.hasRole('Guest')).to.be.false;
        });

        it('ensures that removal of all Roles results in Role-specific rules being removed', function () {
            AclService.addRole('Guest').allow('Guest');
            expect(AclService.isAllowed('Guest')).to.be.true;

            AclService.removeRoleAll();

            AclService.addRole('Guest');
            expect(AclService.isAllowed('Guest')).to.be.false;
        });

        it('ensures that an exception is thrown when a non-existent Role is specified as a parent upon Role addition', function () {
            expect(function() {
                AclService.addRole('tst', 'unexisted');
            }).to.throw(Error);
        });

        it('ensures that an exception is thrown when a not Role is passed', function () {
            expect(function() {
                AclService.addRole({});
            }).to.throw(/expects role to be/);
            expect(function() {
                AclService.addRole('');
            }).to.throw(/expects role to be/);
        });
    });

    describe('Resource management', function () {
        it('ensures that getResources() method works as expected', function () {
            expect(AclService.getResources()).to.deep.equal([]);

            AclService
                .addResource('Animal')
                .addResource('Cat', 'Animal')
                .addResource('Kitty', 'Cat')
                .addResource('Rock');

            expect(AclService.getResources()).to.deep.equal(['Animal', 'Cat', 'Kitty', 'Rock']);
        });

        it('should remove single resource', function () {
            AclService
                .addResource('Animal')
                .addResource('Cat', 'Animal')
                .addResource('Kitty', 'Cat');

            expect(AclService.hasResource('Cat')).to.be.true;

            AclService.removeResource('Cat');

            expect(AclService.hasResource('Cat')).to.be.false;
            expect(AclService.hasResource('Kitty')).to.be.false;

            AclService.removeResource({
                getResourceId: function () {
                    return 'Animal';
                }
            });

            expect(AclService.hasResource('Animal')).to.be.false;
        });

        it('should throw Exception during removal of unexisted resource', function () {
            expect(function() {
                AclService.removeResource('nonexistent');
            }).to.throw(Error);
        });

        it('ensures that an exception is thrown when a non-existent Resource is specified as a parent upon Resource addition', function () {
            expect(function() {
                AclService.addResource('Animal', 'nonexistent');
            }).to.throw();
        });

        it('ensures that the same Resource cannot be added more than once', function () {
            AclService.addResource('tst');
            expect(function() {
                AclService.addResource('tst');
            }).to.throw();
        });

        it('ensures that an exception is thrown when a non-existent resource is specified to each parameter of inherits()', function () {
            AclService.addResource('Animal');

            expect(function() {
                AclService.inheritsResource('nonexistent', 'Animal');
            }).to.throw(Error);

            expect(function() {
                AclService.inheritsResource('Animal', 'nonexistent');
            }).to.throw(Error);
        });

        it('ensures that an exception is thrown when a not Resource is passed', function () {
            expect(function() {
                AclService.addResource({});
            }).to.throw(/expects resource to be/);
            expect(function() {
                AclService.addResource('');
            }).to.throw(/expects resource to be/);
        });

        it('tests basic resource inheritance', function () {
            AclService
                .addResource('city')
                .addResource('building', 'city')
                .addResource('room', 'building');

            expect(AclService.inheritsResource('building', 'city', true)).to.be.true;
            expect(AclService.inheritsResource('room', 'building', true)).to.be.true;
            expect(AclService.inheritsResource('room', 'city')).to.be.true;
            expect(AclService.inheritsResource('room', 'city', true)).to.be.false;
            expect(AclService.inheritsResource('city', 'building')).to.be.false;
            expect(AclService.inheritsResource('building', 'room')).to.be.false;
            expect(AclService.inheritsResource('city', 'room')).to.be.false;

            AclService.removeResource('building');
            expect(AclService.hasResource('room')).to.be.false;
        });

        it('ensures that removal of all resources works', function () {
            AclService
                .addResource('Animal')
                .addResource('Fish')
                .removeResourceAll();

            expect(AclService.hasResource('Animal')).to.be.false;
            expect(AclService.hasResource('Fish')).to.be.false;
        });

        it('ensures that removal of all resources results in Resource-specific rules being removed', function () {
            AclService
                .addResource('Animal')
                .allow(null, 'Animal');

            expect(AclService.isAllowed(null, 'Animal')).to.be.true;

            AclService.removeResourceAll().addResource('Animal');

            expect(AclService.isAllowed(null, 'Animal')).to.be.false;
        });
    });

    describe('can()', function () {
        it('should work with user with multiple roles', function () {
            AclService.addRole('User');
            AclService.addRole('Manager');
            AclService.addResource('Posts');
            AclService.allow('Manager', 'Posts');

            userIdentityStub.roles = ['User', 'Manager'];
            AclService.setUserIdentity(userIdentityStub);

            expect(AclService.can('Posts')).to.be.true;
        });

        it('should work with assertions', function () {
            AclService.addRole('User');
            AclService.addResource('Posts');
            AclService.allow('User', 'Posts', null, function (role, resource, privilege) {
                return role.name === 'Dezmond' && resource === 'Posts';
            });

            userIdentityStub.roles = ['User'];
            userIdentityStub.name = 'Dezmond';
            AclService.setUserIdentity(userIdentityStub);

            expect(AclService.can('Posts')).to.be.true;
        });

        it('should throw error with empty user identity', function () {
            AclService.addRole('User');
            AclService.addResource('Posts');
            AclService.allow('User', 'Posts');

            userIdentityStub.roles = ['User'];
            AclService.setUserIdentity(userIdentityStub);
            AclService.clearUserIdentity();

            expect(function () {
                AclService.can('Posts');
            }).to.throw(Error, 'User identity is null');
        });
    });

    describe('isAllowed()', function () {
        it('should work with role & resource inheritance', function () {
            AclService.addRole('user');
            AclService.addRole('admin', 'user');
            AclService.addRole('manager', 'user');

            AclService.addResource('User');
            AclService.addResource('Manager', 'User');
            AclService.addResource('Admin', 'User');

            AclService.allow('user', 'User', 'edit');
            AclService.allow('manager', 'Manager', 'view');

            expect(AclService.isAllowed('admin', 'Admin', 'edit')).to.be.true;
            expect(AclService.isAllowed('user', 'Admin', 'edit')).to.be.true;
            expect(AclService.isAllowed('admin', 'User', 'edit')).to.be.true;
            expect(AclService.isAllowed('user', 'User', 'edit')).to.be.true;

            expect(AclService.isAllowed('manager', 'Manager', 'view')).to.be.true;
            expect(AclService.isAllowed('user', 'Manager', 'view')).to.be.false;
            expect(AclService.isAllowed('user', 'Manager', 'edit')).to.be.true;
            expect(AclService.isAllowed('manager', 'User', 'view')).to.be.false;

            expect(AclService.isAllowed('admin', 'Admin')).to.be.false;
        });

        it('privilege test', function () {
            AclService.addRole('user');
            AclService.addResource('User');
            AclService.allow('user', 'User');

            expect(AclService.isAllowed('user', 'User')).to.be.true;
            expect(AclService.isAllowed('user', 'User', 'anything')).to.be.true;
        });

        it('should work with ncAclResourceInterface', function () {
            AclService.addRole('user');
            AclService.addResource('test');
            AclService.allow('user', 'test', null, function (role, resource, privilege) {
                return role === 'user' && resource.name === 'Dezmond';
            });

            expect(AclService.isAllowed('user', resourceStub)).to.be.true;
            expect(AclService.isAllowed('user', resourceStub, 'anything')).to.be.true;
        });
    });

    describe('allow()', function () {
        it('Should work with one role no privilege', function () {
            AclService.addRole('user');
            userIdentityStub.roles = ['user'];
            AclService.setUserIdentity(userIdentityStub);
            AclService.addResource('Post');
            AclService.addResource('Comment');
            AclService.allow('user', 'Post');

            expect(AclService.can('Post')).to.be.true;
            expect(AclService.can('Post', 'view')).to.be.true;
            expect(AclService.can('Comment')).to.be.false;
            expect(AclService.can('Comment', 'view')).to.be.false;
        });

        it('Should work with one role & privilege', function () {
            AclService.addRole('user');
            userIdentityStub.roles = ['user'];
            AclService.setUserIdentity(userIdentityStub);
            AclService.addResource('Post');
            AclService.allow('user', 'Post', 'edit');

            expect(AclService.can('Post', 'edit')).to.be.true;
            expect(AclService.can('Post', 'view')).to.be.false;
            expect(AclService.can('Post')).to.be.false;
        });

        it('Should work with multiple roles', function () {
            AclService.addRole('user');
            AclService.addRole('commenter');

            userIdentityStub.roles = ['user', 'commenter'];
            AclService.setUserIdentity(userIdentityStub);

            AclService.addResource('Post');
            AclService.addResource('Comment');

            AclService.allow('user', 'Post');
            AclService.allow('commenter', 'Comment');

            expect(AclService.can('Post')).to.be.true;
            expect(AclService.can('Comment')).to.be.true;
        });
    });

    describe('removeAllow()', function () {
        it('basic rule removal works', function () {
            AclService.allow(null, null, ['privilege1', 'privilege2']);
            expect(AclService.isAllowed()).to.be.false;
            expect(AclService.isAllowed(null, null, 'privilege1')).to.be.true;
            expect(AclService.isAllowed(null, null, 'privilege2')).to.be.true;
            AclService.removeAllow(null, null, ['privilege1']);
            expect(AclService.isAllowed(null, null, 'privilege1')).to.be.false;
            expect(AclService.isAllowed(null, null, 'privilege2')).to.be.true;
        });

        it('default allow removal', function () {
            AclService.allow();
            expect(AclService.isAllowed()).to.be.true;
            AclService.removeAllow();
            expect(AclService.isAllowed()).to.be.false;
        });
    });

    describe('removeDeny()', function () {
        it('Ensures that removing non-existent default deny rule does nothing', function () {
            AclService.allow().removeDeny();
            expect(AclService.isAllowed()).to.be.true;
        });
        it('Ensures that removing the default deny rule results in default deny rule', function () {
            expect(AclService.isAllowed()).to.be.false;
            AclService.removeDeny();
            expect(AclService.isAllowed()).to.be.false;
        });
    });
});