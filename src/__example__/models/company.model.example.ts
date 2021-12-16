import neo4j from '../driver.example';
import CompanySchema from '../schemas/company.schema.example';
import UserSchema from '../schemas/user.schema.example';

const companyModel = {
  async create(data: {
    name: string;
    plan: 'freemium' | 'premium';
  }): Promise<CompanySchema | null> {
    return neo4j.createWithGraphAware('Company', data, CompanySchema);
  },

  async findByUid(companyUid: string) {
    return neo4j
      .read(
        `
          MATCH (company:Company {uid:{companyUid}})
          RETURN company
        `,
        { companyUid },
      )
      .declare<{ company: CompanySchema }>({ company: CompanySchema })
      .single();
  },

  async attachUser(companyUid: string, userUid: string) {
    return neo4j
      .write(
        `
          MATCH (company:Company {uid:{companyUid}})
          MATCH (user:User {uid:{userUid}})
          MERGE (company)-[:HAS]->(user)
        `,
        { companyUid, userUid },
      )
      .run();
  },

  async users(companyUid: string) {
    return neo4j
      .read(
        `
          MATCH (:Company {uid:{companyUid}})-[:HAS]->(user:User)
          RETURN DISTINCT user
        `,
        { companyUid },
      )
      .declare<{ user: UserSchema }>({ user: UserSchema })
      .all();
  },
};
export default companyModel;
