using Microsoft.EntityFrameworkCore.Migrations;

namespace TechnicalDiagnosis.DataLayer.Migrations
{
    public partial class V2019_12_03_0046 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Plates_TypeVehicles_TypeVehicleId",
                table: "Plates");

            migrationBuilder.AlterColumn<int>(
                name: "TypeVehicleId",
                table: "Plates",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Plates_TypeVehicles_TypeVehicleId",
                table: "Plates",
                column: "TypeVehicleId",
                principalTable: "TypeVehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Plates_TypeVehicles_TypeVehicleId",
                table: "Plates");

            migrationBuilder.AlterColumn<int>(
                name: "TypeVehicleId",
                table: "Plates",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Plates_TypeVehicles_TypeVehicleId",
                table: "Plates",
                column: "TypeVehicleId",
                principalTable: "TypeVehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
