const FormWorkspace = ({ children }) => {
    return (
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">

            <div className="
        grid
        grid-cols-1
        lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]
        gap-5
        items-start
      ">
                {children}
            </div>

        </section>
    );
};

export default FormWorkspace;