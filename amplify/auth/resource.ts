import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    
    externalProviders: {
      callbackUrls: ["https://main.d1ajb21hsxi2dm.amplifyapp.com/api/auth/sign-in-callback"],
      logoutUrls: ["https://main.d1ajb21hsxi2dm.amplifyapp.com/api/auth/sign-out-callback"],
    },
  },

});
