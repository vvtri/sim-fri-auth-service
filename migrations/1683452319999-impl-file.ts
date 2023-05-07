import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplFile1683452319999 implements MigrationInterface {
    name = 'ImplFile1683452319999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."file_audience_type_enum" AS ENUM('ONLY_ME', 'FRIEND', 'PUBLIC')`);
        await queryRunner.query(`CREATE TYPE "public"."file_file_type_enum" AS ENUM('png', 'jpg', 'jpeg', 'pdf', 'mp3', 'mp4', 'wav', 'xlsx', 'xls', 'csv')`);
        await queryRunner.query(`CREATE TABLE "file" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "key" character varying(255) NOT NULL, "bucket" character varying(255) NOT NULL, "size" character varying NOT NULL DEFAULT '0', "audience_type" "public"."file_audience_type_enum" NOT NULL, "file_type" "public"."file_file_type_enum" NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_516f1cf15166fd07b732b4b6ab0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_516f1cf15166fd07b732b4b6ab0"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TYPE "public"."file_file_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."file_audience_type_enum"`);
    }

}
