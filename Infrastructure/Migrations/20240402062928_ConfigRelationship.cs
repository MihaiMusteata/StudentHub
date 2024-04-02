using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Submissions_DocumentId",
                table: "Submissions");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_DocumentId",
                table: "Submissions",
                column: "DocumentId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Submissions_DocumentId",
                table: "Submissions");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_DocumentId",
                table: "Submissions",
                column: "DocumentId");
        }
    }
}
