export default function ProjectList({
  projects,
  onSelect
}) {

  return (

    <div className="space-y-2">

      {projects.map(project => (

        <button
          key={project.id}
          onClick={() =>
            onSelect(project)
          }
          className="
          w-full
          text-left
          p-3
          rounded-lg
          border
          hover:bg-gray-50
          "
        >
          <div className="font-medium">
            {project.name}
          </div>

          <div className="text-xs text-gray-500">
            {project.project_type}
          </div>

        </button>

      ))}

    </div>

  );
}