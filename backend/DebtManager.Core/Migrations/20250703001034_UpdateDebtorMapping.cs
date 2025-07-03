using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DebtManager.Core.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDebtorMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DebtorDocumentType",
                table: "DebtTitles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DebtorDocumentType",
                table: "DebtTitles");
        }
    }
}
