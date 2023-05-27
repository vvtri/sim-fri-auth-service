import { MigrationInterface, QueryRunner } from "typeorm";

export class FixFile1685168226805 implements MigrationInterface {
    name = 'FixFile1685168226805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_3c011f4eefd39da06c16ace49a2"`);
        await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "file_id_seq"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_3c011f4eefd39da06c16ace49a2" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_3c011f4eefd39da06c16ace49a2"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "file_id_seq" OWNED BY "file"."id"`);
        await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "id" SET DEFAULT nextval('"file_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_3c011f4eefd39da06c16ace49a2" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
