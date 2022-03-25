// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';
import { securityId, UserProfile } from '@loopback/security';
import _ from 'lodash';

// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.
export async function basicAuthorization(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  let currentUser: UserProfile;
  if (authorizationCtx.principals.length > 0) {
    const user = _.pick(authorizationCtx.principals[0], [
      'id',
      'name',
      'role',
    ]);
    currentUser = { [securityId]: user.id, name: user.name, role: user.role };
  } else {
    return AuthorizationDecision.DENY;
  }

  if (!currentUser.role) {
    return AuthorizationDecision.DENY;
  }

  if (!metadata.allowedRoles) {
    return AuthorizationDecision.ALLOW;
  }

  let roleIsAllowed = false;
  for (const role of currentUser.role) {
    if (metadata.allowedRoles!.includes(role)) {
      roleIsAllowed = true;
      break;
    }
  }

  if (!roleIsAllowed) {
    return AuthorizationDecision.DENY;
  }

  if (
    currentUser.role.includes('admin') ||
    currentUser.role.includes('support')
  ) {
    return AuthorizationDecision.ALLOW;
  }

  if (currentUser[securityId] === authorizationCtx.invocationContext.args[0]) {
    return AuthorizationDecision.ALLOW;
  }

  return AuthorizationDecision.DENY;
}