# JS ACL

[![Build Status](https://travis-ci.org/StyleT/js-acl.svg?branch=master)](https://travis-ci.org/StyleT/js-acl)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://github.com/StyleT/js-acl/blob/master/LICENSE)

---

## About
JS ACL _(Access Control List)_ is a service that allows you to protect/show content based on the current user's assigned role(s),
and those role(s) permissions (abilities).

For the purposes of this documentation:
- a **resource** is an object to which access is controlled.
- a **role** is an object that may request access to a Resource.

Put simply, **roles request access to resources**. For example, if a parking attendant requests access to a car,
then the parking attendant is the requesting role, and the car is the resource, since access to the car may not be granted to everyone.

Through the specification and use of an ACL, an application may control how roles are granted access to resources.

## Quick Examples

First you need to install this library :)

- `npm install --save js-acl`

```html
<script src="/node_modules/js-acl/dist/acl.js"></script>
```
```js
const Acl = require('js-acl');
```

#### Set Data
```js
//In case of Node.js
const AclService = require('js-acl');
//In case of Browser
var AclService = window.JsAcl;

//All these actions you also can do in the middle of app execution
AclService.addRole('guest');
AclService.addRole('user', 'guest');
AclService.addRole('admin', 'user');

AclService.addResource('Post');
AclService.addResource('Users');
AclService.addResource('AdminPanel');

AclService.allow('guest', 'Post', 'view');

//Users can edit edit their own posts & view it because user inherits all guest permissions
AclService.allow('user', 'Post', 'edit', function (role, resource, privilege) {
    return resource.authorId === role.id;
});

//Full access to all actions that available for Post
AclService.allow('admin', 'Post');
AclService.allow('admin', 'AdminPanel');

//Let's assume that you have some user object that implements AclRoleInterface. This is optional feature.
var user = {
    id: 1,
    name: 'Duck',
    getRoles: function () {
        return ['user'];
    },
};
AclService.setUserIdentity(user);
```


## How secure is this if I'm using it in browser?

A great analogy to ACL's in JavaScript would be form validation in JavaScript.  Just like form validation, ACL's in the
browser can be tampered with. However, just like form validation, ACL's are really useful and provide a better experience
for the user and the developer. Just remember, **any sensitive data or actions should require a server (or similar) as the final authority**.

#### Example Tampering Scenario

The current user has a role of "guest".  A guest is not able to "create_users". However, this sneaky guest is clever
enough to tamper with the system and give themselves that privilege. So, now that guest is at the "Create Users" page,
and submits the form. The form data is sent the the server and the user is greeted with an "Access Denied: Unauthorized"
message, because the server also checked to make sure that the user had the correct permissions.

Any sensitive data or actions should integrate a server check.
