using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DebtManager.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddPenaltyRateField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PenaltyRate",
                table: "DebtTitles",
                type: "decimal(5,4)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PenaltyRate",
                table: "DebtTitles");
        }
    }
}
