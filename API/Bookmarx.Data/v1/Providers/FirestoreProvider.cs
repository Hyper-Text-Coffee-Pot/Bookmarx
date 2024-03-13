using Bookmarx.Data.v1.Interfaces;
using Google.Cloud.Firestore;

namespace Bookmarx.Data.v1.Providers;

/// <summary>
/// Thank you to Artur Kedzior and Pieter Linde!
/// https://dev.to/kedzior_io/simple-net-core-and-cloud-firestore-setup-1pf9
/// https://pieterdlinde.medium.com/netcore-and-cloud-firestore-94628943eb3c
/// </summary>
public class FirestoreProvider
{
	private readonly FirestoreDb _fireStoreDb = null!;

	public FirestoreProvider(FirestoreDb fireStoreDb)
	{
		_fireStoreDb = fireStoreDb;
	}

	public async Task AddOrUpdateById<T>(T entity, CancellationToken ct) where T : IFirebaseEntity
	{
		var document = _fireStoreDb.Collection(typeof(T).Name).Document(entity.Id);
		await document.SetAsync(entity, cancellationToken: ct);
	}

	/// <summary>
	/// The Create method will throw an exception if the document already exists.
	/// </summary>
	/// <typeparam name="T"></typeparam>
	/// <param name="entity"></param>
	/// <param name="ct"></param>
	/// <returns></returns>
	public async Task Create<T>(T entity, CancellationToken ct) where T : IFirebaseEntity
	{
		var document = _fireStoreDb.Collection(typeof(T).Name).Document(entity.Id);
		await document.CreateAsync(entity, cancellationToken: ct);
	}

	public async Task<T> Get<T>(string id, CancellationToken ct) where T : IFirebaseEntity
	{
		var document = _fireStoreDb.Collection(typeof(T).Name).Document(id);
		var snapshot = await document.GetSnapshotAsync(ct);
		return snapshot.ConvertTo<T>();
	}

	public async Task<IReadOnlyCollection<T>> GetAll<T>(CancellationToken ct) where T : IFirebaseEntity
	{
		var collection = _fireStoreDb.Collection(typeof(T).Name);
		var snapshot = await collection.GetSnapshotAsync(ct);
		return snapshot.Documents.Select(x => x.ConvertTo<T>()).ToList();
	}

	public async Task<IReadOnlyCollection<T>> WhereEqualTo<T>(string fieldPath, object value, CancellationToken ct) where T : IFirebaseEntity
	{
		return await GetList<T>(_fireStoreDb.Collection(typeof(T).Name).WhereEqualTo(fieldPath, value), ct);
	}

	// just add here any method you need here WhereGreaterThan, WhereIn etc ...

	private static async Task<IReadOnlyCollection<T>> GetList<T>(Query query, CancellationToken ct) where T : IFirebaseEntity
	{
		var snapshot = await query.GetSnapshotAsync(ct);
		return snapshot.Documents.Select(x => x.ConvertTo<T>()).ToList();
	}
}