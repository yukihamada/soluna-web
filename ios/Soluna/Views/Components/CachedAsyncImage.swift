import SwiftUI
import CryptoKit

struct CachedAsyncImage<Placeholder: View>: View {
    let url: URL?
    let placeholder: () -> Placeholder

    @State private var image: UIImage?
    @State private var isLoading = false

    init(url: URL?, @ViewBuilder placeholder: @escaping () -> Placeholder) {
        self.url = url
        self.placeholder = placeholder
    }

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                placeholder()
            }
        }
        .task(id: url) {
            await loadImage()
        }
    }

    private func loadImage() async {
        guard let url, !isLoading else { return }
        isLoading = true
        defer { isLoading = false }

        let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ImageCache", isDirectory: true)

        try? FileManager.default.createDirectory(at: cacheDir, withIntermediateDirectories: true)

        let hash = SHA256.hash(data: Data(url.absoluteString.utf8))
            .compactMap { String(format: "%02x", $0) }.joined()
        let cachedFile = cacheDir.appendingPathComponent(hash)

        // Try cache first
        if let data = try? Data(contentsOf: cachedFile), let cached = UIImage(data: data) {
            self.image = cached
            return
        }

        // Download
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let downloaded = UIImage(data: data) {
                self.image = downloaded
                try? data.write(to: cachedFile)
            }
        } catch {
            print("Image download failed: \(error.localizedDescription)")
        }
    }
}
