      *================================================================*
      * VEDBATCH - VEHICLE EXCISE DUTY BATCH RATING RUN                *
      *                                                                *
      * READS ONE VEHICLE PER LINE (35 CHARACTERS), CALLS VEDCALC,     *
      * WRITES ONE RESULT PER LINE (17 CHARACTERS). RECORD LAYOUTS     *
      * ARE SET OUT IN DOCS/RULES.MD.                                  *
      *                                                                *
      * USAGE: VEDBATCH INPUT-FILE OUTPUT-FILE                         *
      *                                                                *
      * UK GOVERNMENT DEMO SERVICE. FICTIONAL. RATES ARE INVENTED.     *
      *================================================================*
       IDENTIFICATION DIVISION.
       PROGRAM-ID. VEDBATCH.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT VEH-IN  ASSIGN TO WS-IN-NAME
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-IN-STATUS.
           SELECT RATE-OUT ASSIGN TO WS-OUT-NAME
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-OUT-STATUS.
       DATA DIVISION.
       FILE SECTION.
       FD  VEH-IN.
       01  VEH-IN-REC                 PIC X(35).
       FD  RATE-OUT.
       01  RATE-OUT-REC               PIC X(17).
       WORKING-STORAGE SECTION.
       01  WS-IN-NAME                 PIC X(256) VALUE SPACES.
       01  WS-OUT-NAME                PIC X(256) VALUE SPACES.
       01  WS-IN-STATUS               PIC XX.
       01  WS-OUT-STATUS              PIC XX.
       01  WS-EOF                     PIC X VALUE "N".
           88  END-OF-INPUT           VALUE "Y".
       01  WS-COUNT                   PIC 9(7) VALUE ZERO.
       01  WS-COUNT-OUT               PIC Z(6)9.
       01  WS-VEHICLE.
           05  WS-V-REG               PIC X(8).
           05  WS-V-FIRST-REG         PIC 9(6).
           05  WS-V-FUEL              PIC X.
           05  WS-V-CO2               PIC 9(3).
           05  WS-V-ENGINE            PIC 9(4).
           05  WS-V-PRICE             PIC 9(6).
           05  WS-V-FIRST-LIC         PIC X.
           05  WS-V-LIC-START         PIC 9(6).
       01  WS-RESULT.
           05  WS-R-RATE              PIC 9(5).
           05  WS-R-CODE              PIC X(4).
       01  WS-OUT-LINE.
           05  WS-O-REG               PIC X(8).
           05  WS-O-RATE              PIC 9(5).
           05  WS-O-CODE              PIC X(4).
       PROCEDURE DIVISION.
       0000-MAIN.
           ACCEPT WS-IN-NAME  FROM ARGUMENT-VALUE
           ACCEPT WS-OUT-NAME FROM ARGUMENT-VALUE
           IF WS-IN-NAME = SPACES OR WS-OUT-NAME = SPACES
               DISPLAY "USAGE: VEDBATCH INPUT-FILE OUTPUT-FILE"
               MOVE 8 TO RETURN-CODE
               STOP RUN
           END-IF
           OPEN INPUT VEH-IN
           IF WS-IN-STATUS NOT = "00"
               DISPLAY "VEDBATCH: CANNOT OPEN INPUT, STATUS "
                   WS-IN-STATUS
               MOVE 8 TO RETURN-CODE
               STOP RUN
           END-IF
           OPEN OUTPUT RATE-OUT
           IF WS-OUT-STATUS NOT = "00"
               DISPLAY "VEDBATCH: CANNOT OPEN OUTPUT, STATUS "
                   WS-OUT-STATUS
               MOVE 8 TO RETURN-CODE
               STOP RUN
           END-IF
           PERFORM 1000-READ
           PERFORM 2000-PROCESS UNTIL END-OF-INPUT
           CLOSE VEH-IN RATE-OUT
           MOVE WS-COUNT TO WS-COUNT-OUT
           DISPLAY "VEDBATCH: " FUNCTION TRIM(WS-COUNT-OUT)
               " VEHICLES RATED"
           STOP RUN.
       1000-READ.
           READ VEH-IN
               AT END SET END-OF-INPUT TO TRUE
           END-READ.
       2000-PROCESS.
           MOVE VEH-IN-REC TO WS-VEHICLE
           CALL "VEDCALC" USING WS-VEHICLE WS-RESULT
           MOVE WS-V-REG  TO WS-O-REG
           MOVE WS-R-RATE TO WS-O-RATE
           MOVE WS-R-CODE TO WS-O-CODE
           WRITE RATE-OUT-REC FROM WS-OUT-LINE
           ADD 1 TO WS-COUNT
           PERFORM 1000-READ.
