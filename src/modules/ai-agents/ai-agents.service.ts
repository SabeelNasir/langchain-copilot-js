import { MongoDataSource } from "../../database/mongo-datasource.js";
import { AIAgentsEntity } from "../../database/entities/mongodb/ai-agents.entity.js";
import { ObjectId } from "mongodb";

export class AIAgentsService {
  private repo = MongoDataSource.getMongoRepository(AIAgentsEntity);

  async create(data: Partial<AIAgentsEntity>) {
    const agent = this.repo.create(data);
    return await this.repo.save(agent);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findById(id: string | ObjectId) {
    return await this.repo.findOneBy({ _id: new ObjectId(id) });
  }

  async update(id: string, data: Partial<AIAgentsEntity>) {
    await this.repo.update({ _id: new ObjectId(id) }, data);
    return this.findById(id);
  }

  async delete(id: string) {
    return await this.repo.delete({ _id: new ObjectId(id) });
  }
}
