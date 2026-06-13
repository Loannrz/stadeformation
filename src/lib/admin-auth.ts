export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

export function getAdminSessionToken(): string | undefined {
  return process.env.ADMIN_SESSION_TOKEN;
}
