'use strict';

/**
 * @name AclRegistry
 * @constructs AclRegistry
 * @description Initializes a new ACL role registry
 */
function AclRegistry() {
    var self = this;
    var _storage = {};

    self.add = function (item, parents /*null*/) {
        parents = typeof parents === 'undefined' ? null : parents;

        if (self.has(item)) {
            throw new Error('Item "' + item + '" already exists in the registry');
        }

        var itemParents = [];

        if (parents !== null) {
            if (!Array.isArray(parents)) {
                parents = [parents];
            }

            parents.forEach(function (parent) {
                if (!self.has(parent)) {
                    throw new Error('Parent role "' + parent + '" for "' + item + '" not exists in the registry');
                }

                itemParents.push(parent);
                _storage[parent].children.push(item);
            });
        }

        _storage[item] = {
            id: item,
            parents: itemParents,
            children: []
        };

        return self;
    };

    self.get = function (item) {
        if (!self.has(item)) {
            throw new Error('Item "' + item + '" not exists in the registry');
        }

        return item;
    };

    self.has = function (item) {
        return _storage[item] !== undefined;
    };

    self.getParents = function (item) {
        if (!self.has(item)) {
            throw new Error('Item "' + item + '" not exists in the registry');
        }

        return _storage[item].parents;
    };

    self.inherits = function (item, inherit, onlyParents /*false*/) {
        onlyParents = typeof onlyParents === 'undefined' ? false : onlyParents;

        if (!self.has(item) || !self.has(inherit)) {
            throw new Error('Items not exists in the registry');
        }

        var inherits = _storage[item].parents.indexOf(inherit) !== -1;

        if (inherits || onlyParents) {
            return inherits;
        }

        for (var i = 0; i < _storage[item].parents.length; i++) {
            var parent = _storage[item].parents[i];

            if (self.inherits(parent, inherit)) {
                return true;
            }
        }

        return false;
    };

    self.remove = function (item) {
        if (!self.has(item)) {
            throw new Error('Item "' + item + '" not exists in the registry');
        }

        _storage[item].children.forEach(function (child) {
            var index = _storage[child].parents.indexOf(item);
            if (index !== -1) {
                _storage[child].parents.splice(index, 1);
            }
        });
        _storage[item].parents.forEach(function (parent) {
            var index = _storage[parent].children.indexOf(item);
            if (index !== -1) {
                _storage[parent].children.splice(index, 1);
            }
        });

        delete _storage[item];

        return self;
    };

    self.removeAll = function () {
        _storage = {};

        return self;
    };

    self.getItems = function () {
        return JSON.parse(JSON.stringify(_storage));
    };

    return self;
}

module.exports = AclRegistry;