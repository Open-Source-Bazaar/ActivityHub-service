import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import {
    ActivityController,
    ActivitySessionController,
    CooperationController,
    SessionSubmitController
} from './Activity';
import { ActivityLogController } from './ActivityLog';
import { BaseController } from './Base';
import { FileController } from './File';
import { OauthController } from './OAuth';
import { OrganizationController, PlaceController } from './Organization';
import { UserController } from './User';
import { WebAuthnController } from './WebAuthn';

export * from './Activity';
export * from './ActivityLog';
export * from './Base';
export * from './File';
export * from './OAuth';
export * from './Organization';
export * from './User';
export * from './WebAuthn';

export const controllers = [
    CooperationController,
    SessionSubmitController,
    ActivitySessionController,
    ActivityController,
    PlaceController,
    OrganizationController,
    WebAuthnController,
    OauthController,
    UserController,
    ActivityLogController,
    FileController,
    BaseController
];
export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers
});
