using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DebtManager.Core.Migrations
{
    /// <inheritdoc />
    public partial class InitialWithTitleNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TitleNumber",
                table: "DebtTitles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_DebtTitles_TitleNumber",
                table: "DebtTitles",
                column: "TitleNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DebtTitles_TitleNumber",
                table: "DebtTitles");

            migrationBuilder.DropColumn(
                name: "TitleNumber",
                table: "DebtTitles");
        }
    }
}
