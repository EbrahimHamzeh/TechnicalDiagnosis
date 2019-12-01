using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace TechnicalDiagnosis.DataLayer.Migrations
{
    public partial class V2019_12_02_0014 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TypeVehicles",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(nullable: true),
                    TimeInterval = table.Column<int>(nullable: false),
                    IsActive = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypeVehicles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Plates",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(nullable: true),
                    Mobile = table.Column<string>(nullable: true),
                    PlateState = table.Column<string>(nullable: true),
                    PlateFirstNumber = table.Column<string>(nullable: true),
                    PlateAlphabet = table.Column<string>(nullable: true),
                    PlateLastNumber = table.Column<string>(nullable: true),
                    IsActive = table.Column<bool>(nullable: false),
                    ServiceDate = table.Column<DateTime>(nullable: false),
                    IsTechnicalDiagnosis = table.Column<bool>(nullable: false),
                    TypeVehicleId = table.Column<int>(nullable: false),
                    Description = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Plates_TypeVehicles_TypeVehicleId",
                        column: x => x.TypeVehicleId,
                        principalTable: "TypeVehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Plates_TypeVehicleId",
                table: "Plates",
                column: "TypeVehicleId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Plates");

            migrationBuilder.DropTable(
                name: "TypeVehicles");
        }
    }
}
