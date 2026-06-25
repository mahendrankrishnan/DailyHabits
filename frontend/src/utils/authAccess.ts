import { LoginResponse, UserApplicationsRoles } from '../types';

export const REQUIRED_APP_NAME = 'MyDailyHabits';

export function hasMyDailyHabitsAccess(data: UserApplicationsRoles): boolean {
  const app = data.applications?.find(
    (application) => application.appName === REQUIRED_APP_NAME
  );

  return Boolean(app && app.roles?.length >= 1);
}

export function getAccessDeniedMessage(): string {
  return `Access denied. You need at least one role for the "${REQUIRED_APP_NAME}" application.`;
}

export function extractUserId(loginResponse: LoginResponse): number | null {
  return loginResponse.user?.id ?? null;
}

export function toUserApplicationsRoles(
  loginResponse: LoginResponse,
  userId: number
): UserApplicationsRoles | null {
  if (!loginResponse.applications?.length) {
    return null;
  }

  return {
    userId,
    applications: loginResponse.applications,
  };
}
