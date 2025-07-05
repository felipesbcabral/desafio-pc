using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DebtManager.Core.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDecimalPrecisionForRates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "PenaltyRate",
                table: "DebtTitles",
                type: "decimal(10,6)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,4)");

            migrationBuilder.AlterColumn<decimal>(
                name: "InterestRatePerDay",
                table: "DebtTitles",
                type: "decimal(10,6)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,4)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "PenaltyRate",
                table: "DebtTitles",
                type: "decimal(5,4)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,6)");

            migrationBuilder.AlterColumn<decimal>(
                name: "InterestRatePerDay",
                table: "DebtTitles",
                type: "decimal(5,4)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,6)");
        }
    }
}
