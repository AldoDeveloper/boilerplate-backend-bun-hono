import { CreatePermission } from "./permission.model";
import { permissionRepo, PermissionRepository } from "./permission.repository";

export class PermissionService{
    
    constructor(private repo : PermissionRepository = permissionRepo) {}

    async find() {
        return await this.repo.find({
            withDeleted: false
        })
    }

    async findSoftDeleted() {
        return await this.repo.find({
            withDeleted: true
        })
    }

    async create(data: CreatePermission) {
        const create = await this.repo.create(data);
        return create;
    }

    async update(id: string, data: Partial<CreatePermission>){
        const update = await this.repo.update(id, data);
        return update;
    }

    async softDelete(id: string){
        const remove = await this.repo.softDelete(id);
        return remove;
    }

    async restore(id: string){
        const restore = await this.repo.restore(id);
        return restore;
    }
}

export const permissionService = new PermissionService();