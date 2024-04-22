using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Modify_GradesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Submissions_SubmissionId",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "GradeDate",
                table: "Grades");

            migrationBuilder.RenameColumn(
                name: "SubmissionId",
                table: "Grades",
                newName: "StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_Grades_SubmissionId",
                table: "Grades",
                newName: "IX_Grades_StudentId");

            migrationBuilder.AddColumn<int>(
                name: "AssignmentId",
                table: "Grades",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Grades_AssignmentId",
                table: "Grades",
                column: "AssignmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_LessonAssignments_AssignmentId",
                table: "Grades",
                column: "AssignmentId",
                principalTable: "LessonAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Students_StudentId",
                table: "Grades",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grades_LessonAssignments_AssignmentId",
                table: "Grades");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Students_StudentId",
                table: "Grades");

            migrationBuilder.DropIndex(
                name: "IX_Grades_AssignmentId",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "AssignmentId",
                table: "Grades");

            migrationBuilder.RenameColumn(
                name: "StudentId",
                table: "Grades",
                newName: "SubmissionId");

            migrationBuilder.RenameIndex(
                name: "IX_Grades_StudentId",
                table: "Grades",
                newName: "IX_Grades_SubmissionId");

            migrationBuilder.AddColumn<DateTime>(
                name: "GradeDate",
                table: "Grades",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Submissions_SubmissionId",
                table: "Grades",
                column: "SubmissionId",
                principalTable: "Submissions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
