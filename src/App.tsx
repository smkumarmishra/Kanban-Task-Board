import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <div>
      <h1 className="text-center mt-1 mb-1 text-2xl text-white-500">
        Kanban Task Board
      </h1>
      <main>
        <KanbanBoard />
      </main>
    </div>
  );
}

export default App;
