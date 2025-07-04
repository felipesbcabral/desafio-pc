﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DebtManager.Core.Migrations
{
    /// <inheritdoc />
    public partial class FixCascadeDeleteForInstallments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Installments_DebtTitles_DebtTitleId",
                table: "Installments");

            migrationBuilder.AddForeignKey(
                name: "FK_Installments_DebtTitles_DebtTitleId",
                table: "Installments",
                column: "DebtTitleId",
                principalTable: "DebtTitles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Installments_DebtTitles_DebtTitleId",
                table: "Installments");

            migrationBuilder.AddForeignKey(
                name: "FK_Installments_DebtTitles_DebtTitleId",
                table: "Installments",
                column: "DebtTitleId",
                principalTable: "DebtTitles",
                principalColumn: "Id");
        }
    }
}
