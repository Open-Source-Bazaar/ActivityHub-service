import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import {
    ActivityController,
    ActivitySessionController,
    AgendaController,
    CheckEventController,
    CooperationController
} from './Activity';
import { BaseController } from './Base';
import { FileController } from './File';
import { OrganizationController, PlaceController } from './Organization';
import { TagController } from './Tag';
import { ActivityLogController, OauthController, UserController, WebAuthnController } from './User';

export * from './Activity';
export * from './Base';
export * from './File';
export * from './Organization';
export * from './User';

export const controllers = [
    CheckEventController,
    AgendaController,
    ActivitySessionController,
    CooperationController,
    ActivityController,
    PlaceController,
    OrganizationController,
    TagController,
    WebAuthnController,
    OauthController,
    UserController,
    ActivityLogController,
    FileController,
    BaseController
];
export const { swagger, mocker, router } = createAPI({ mock: !isProduct, controllers });
