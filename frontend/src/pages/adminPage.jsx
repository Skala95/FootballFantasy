import PlayerAdminPage from "./PlayerAdminPage";
import MatchAdminPage from "./matchAdminPage";

function AdminPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
            <PlayerAdminPage />
            <MatchAdminPage />
        </div>
    );
}

export default AdminPage;