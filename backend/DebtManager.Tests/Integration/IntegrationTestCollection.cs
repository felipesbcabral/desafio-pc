using Xunit;

namespace DebtManager.Tests.Integration;

/// <summary>
/// Test collection for integration tests.
/// Uses shared containers for all test classes while allowing parallel execution.
/// </summary>
[CollectionDefinition("IntegrationTests")]
public class IntegrationTestCollection : ICollectionFixture<SharedContainerFixture>
{
    // This class has no code, and is never created. Its purpose is simply
    // to be the place to apply [CollectionDefinition] and share the container fixture.
    // All test classes in this collection will share the same Docker containers
    // but can still run in parallel with proper database isolation.
}