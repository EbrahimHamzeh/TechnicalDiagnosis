using Microsoft.EntityFrameworkCore.Migrations;

namespace TechnicalDiagnosis.DataLayer.Migrations
{
    public partial class V2020_01_06_0654 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeInterval",
                table: "TypeVehicles");

            migrationBuilder.AddColumn<int>(
                name: "Days",
                table: "TypeVehicles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "TypeVehicles",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Days",
                table: "TypeVehicles");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "TypeVehicles");

            migrationBuilder.AddColumn<int>(
                name: "TimeInterval",
                table: "TypeVehicles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
