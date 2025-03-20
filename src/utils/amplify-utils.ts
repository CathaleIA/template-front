import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import outputs from '@/../amplify_outputs.json';

export const { runWithAmplifyServerContext, createAuthRouteHandlers } =
    createServerRunner({
        config: outputs,
        runtimeOptions: {
            cookies: {
                domain: 'main.d1ajb21hsxi2dm.amplifyapp.com', //Para subdominios
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            }
        }
    });
