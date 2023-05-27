import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRelationshipStatusEnum1683646445674 implements MigrationInterface {
    name = 'FixRelationshipStatusEnum1683646445674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_profile_relationship_status_enum" RENAME TO "user_profile_relationship_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_profile_relationship_status_enum" AS ENUM('SINGLE', 'IN_RELATIONSHIP', 'MARRIED', 'SECRET')`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "relationship_status" TYPE "public"."user_profile_relationship_status_enum" USING "relationship_status"::"text"::"public"."user_profile_relationship_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_relationship_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_profile_relationship_status_enum_old" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "relationship_status" TYPE "public"."user_profile_relationship_status_enum_old" USING "relationship_status"::"text"::"public"."user_profile_relationship_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_profile_relationship_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_profile_relationship_status_enum_old" RENAME TO "user_profile_relationship_status_enum"`);
    }

}
