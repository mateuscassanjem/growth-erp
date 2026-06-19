export type JwtPayload = {
  sub: string;
  email: string;
  companyId: string;
};

export type RequestUser = {
  id: string;
  email: string;
  companyId: string;
  tokenCompanyId?: string;
};
