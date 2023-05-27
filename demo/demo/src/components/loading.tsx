import "./loading.css"
const Loading = (
    ) => {
    
      const pageName = window.location.href?.split("/")?.pop() || "";
      return (
        <div className="flex items-center justify-center gap-3 flex-col">
          
          <span className="loader"></span>
          <h1>Loading!!</h1>
          <span className="read-the-docs">{pageName} page is loading...</span>
        </div>
      );
    };

export default Loading