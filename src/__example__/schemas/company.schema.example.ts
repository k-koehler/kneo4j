import BaseSchema from './base.schema.example';

interface RawCompany {
  name: string;
  plan: 'freemium' | 'premium';
  uid: string;
}

interface Company {
  name: string;
  is_freemium: boolean;
  uid: string;
}

export default class CompanySchema extends BaseSchema<RawCompany, Company> {
  public get public() {
    const { name, plan, uid } = this.data;
    return {
      name,
      is_freemium: plan === 'freemium',
      uid,
    };
  }
}
