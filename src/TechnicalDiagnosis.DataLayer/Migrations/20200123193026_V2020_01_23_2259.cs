using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace TechnicalDiagnosis.DataLayer.Migrations
{
    public partial class V2020_01_23_2259 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsTechnicalDiagnosis",
                table: "Plates");

            migrationBuilder.CreateTable(
                name: "TemplateMessages",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreateDate = table.Column<DateTime>(nullable: false),
                    Type = table.Column<int>(nullable: false),
                    Content = table.Column<string>(nullable: true),
                    IsActive = table.Column<bool>(nullable: false),
                    Description = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Mobile = table.Column<string>(nullable: true),
                    Content = table.Column<string>(nullable: true),
                    CreateDate = table.Column<DateTime>(nullable: false),
                    SendDate = table.Column<DateTime>(nullable: false),
                    IsActive = table.Column<bool>(nullable: false),
                    Status = table.Column<bool>(nullable: false),
                    TemplateMessageId = table.Column<int>(nullable: true),
                    PlateId = table.Column<int>(nullable: true),
                    Description = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_Plates_PlateId",
                        column: x => x.PlateId,
                        principalTable: "Plates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Messages_TemplateMessages_TemplateMessageId",
                        column: x => x.TemplateMessageId,
                        principalTable: "TemplateMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlateDetails",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(nullable: false),
                    IsTechnicalDiagnosis = table.Column<bool>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    PlateId = table.Column<int>(nullable: true),
                    MessageId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlateDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlateDetails_Messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlateDetails_Plates_PlateId",
                        column: x => x.PlateId,
                        principalTable: "Plates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_PlateId",
                table: "Messages",
                column: "PlateId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_TemplateMessageId",
                table: "Messages",
                column: "TemplateMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_PlateDetails_MessageId",
                table: "PlateDetails",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_PlateDetails_PlateId",
                table: "PlateDetails",
                column: "PlateId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlateDetails");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "TemplateMessages");

            migrationBuilder.AddColumn<bool>(
                name: "IsTechnicalDiagnosis",
                table: "Plates",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
