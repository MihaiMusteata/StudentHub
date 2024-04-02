using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameTableCol : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_CourseLessons_CourseLessonId",
                table: "Submissions");

            migrationBuilder.RenameColumn(
                name: "CourseLessonId",
                table: "Submissions",
                newName: "LessonAssignmentId");

            migrationBuilder.RenameIndex(
                name: "IX_Submissions_CourseLessonId",
                table: "Submissions",
                newName: "IX_Submissions_LessonAssignmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_LessonAssignments_LessonAssignmentId",
                table: "Submissions",
                column: "LessonAssignmentId",
                principalTable: "LessonAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_LessonAssignments_LessonAssignmentId",
                table: "Submissions");

            migrationBuilder.RenameColumn(
                name: "LessonAssignmentId",
                table: "Submissions",
                newName: "CourseLessonId");

            migrationBuilder.RenameIndex(
                name: "IX_Submissions_LessonAssignmentId",
                table: "Submissions",
                newName: "IX_Submissions_CourseLessonId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_CourseLessons_CourseLessonId",
                table: "Submissions",
                column: "CourseLessonId",
                principalTable: "CourseLessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
